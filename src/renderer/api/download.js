import Request from 'request'
import EventEmitter from 'events'
import Progress from 'request-progress'
import Fs from 'fs'
import { basename } from 'path'
// The options argument is optional so you can omit it
// progress(request('https://az412801.vo.msecnd.net/vhd/VMBuild_20141027/VirtualBox/IE11/Windows/IE11.Win8.1.For.Windows.VirtualBox.zip'), {
//     // throttle: 2000,                    // Throttle the progress event to 2000ms, defaults to 1000ms
//     // delay: 1000,                       // Only start to emit after 1000ms delay, defaults to 0ms
//     // lengthHeader: 'x-transfer-length'  // Length header to use, defaults to content-length
// })
// .on('progress', function (state) {
//     // The state is an object that looks like this:
//     // {
//     //     percent: 0.5,               // Overall percent (between 0 to 1)
//     //     speed: 554732,              // The download speed in bytes/sec
//     //     size: {
//     //         total: 90044871,        // The total payload size in bytes
//     //         transferred: 27610959   // The transferred payload size in bytes
//     //     },
//     //     time: {
//     //         elapsed: 36.235,        // The total elapsed seconds since the start (3 decimals)
//     //         remaining: 81.403       // The remaining seconds to finish (3 decimals)
//     //     }
//     // }
//     console.log('progress', state);
// })
// .on('error', function (err) {
//     // Do something with err
// })
// .on('end', function () {
//     // Do something after request finishes
// })
// .pipe(fs.createWriteStream('IE11.Win8.1.For.Windows.VirtualBox.zip'));

class Download extends EventEmitter {
  createDownloadTask(httpOptions, { localPath }) {
    const request = Request(httpOptions)
    const task = Progress(request)
    const localStream = Fs.createWriteStream(localPath)

    task.pipe(localStream)

    for (const event of ['progress', 'error', 'end']) {
      task.on(event, (...args) => this.emit(event, ...args))
    }

    return request
  }
}

export default Download
