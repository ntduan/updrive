export default {
  createThumbnail(originalUrl, targetWidth) {

    const onload = new Promise((resolve, reject) => {
      const image = new Image()
      image.src = originalUrl
      image.onload = () => {
        URL.revokeObjectURL(originalUrl)
        resolve(image)
      }
      image.onerror = () => {
        URL.revokeObjectURL(originalUrl)
        reject(new Error('Could not create thumbnail'))
      }
    })

    return onload
      .then(image => {
        const targetHeight = this.getProportionalHeight(image, targetWidth)
        const canvas = this.resizeImage(image, targetWidth, targetHeight)
        return this.canvasToBlob(canvas, 'image/png')
      })
      .then(blob => {
        if(blob) {
          return URL.createObjectURL(blob)
        } else {
          return ''
        }
      })
  },

  canvasToBlob(canvas, type, quality) {
    if (canvas.toBlob) {
      return new Promise(resolve => {
        canvas.toBlob(resolve, type, quality)
      })
    }
    return Promise.resolve().then(() => {
      return Utils.dataURItoBlob(canvas.toDataURL(type, quality), {})
    })
  },

  resizeImage(image, targetWidth, targetHeight) {
    // Resizing in steps refactored to use a solution from
    // https://blog.uploadcare.com/image-resize-in-browsers-is-broken-e38eed08df01

    image = this.protect(image)

    let steps = Math.ceil(Math.log2(image.width / targetWidth))
    if (steps < 1) {
      steps = 1
    }
    let sW = targetWidth * Math.pow(2, steps - 1)
    let sH = targetHeight * Math.pow(2, steps - 1)
    const x = 2

    while (steps--) {
      let canvas = document.createElement('canvas')
      canvas.width = sW
      canvas.height = sH
      canvas.getContext('2d').drawImage(image, 0, 0, sW, sH)
      image = canvas

      sW = Math.round(sW / x)
      sH = Math.round(sH / x)
    }

    return image
  },

  getProportionalHeight(img, width) {
    const aspect = img.width / img.height
    return Math.round(width / aspect)
  },

  protect (image) {
    // https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element

    var ratio = image.width / image.height

    var maxSquare = 5000000  // ios max canvas square
    var maxSize = 4096  // ie max canvas dimensions

    var maxW = Math.floor(Math.sqrt(maxSquare * ratio))
    var maxH = Math.floor(maxSquare / Math.sqrt(maxSquare * ratio))
    if (maxW > maxSize) {
      maxW = maxSize
      maxH = Math.round(maxW / ratio)
    }
    if (maxH > maxSize) {
      maxH = maxSize
      maxW = Math.round(ratio * maxH)
    }
    if (image.width > maxW) {
      var canvas = document.createElement('canvas')
      canvas.width = maxW
      canvas.height = maxH
      canvas.getContext('2d').drawImage(image, 0, 0, maxW, maxH)
      image.src = 'about:blank'
      image.width = 1
      image.height = 1
      image = canvas
    }

    return image
  }

}
