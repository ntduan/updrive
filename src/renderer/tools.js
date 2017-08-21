import { compose } from 'ramda'
import Moment from 'moment'

export const timestamp = (input, pattern = 'YYYY-MM-DD HH:mm:ss') => (isNaN(input) ? input : Moment.unix(input).format(pattern))

export const digiUnit = (input) => {
    if (input === '-') return ''
    if (isNaN(input)) return input
    if (+input === 0) return '0 B'
    const getSizes = () => ['B', 'KB', 'MB', 'GB', 'TB']
    const getByte = input => Number(Math.abs(input))
    const getIndex = byte => Math.floor(Math.log(byte) / Math.log(1024))
    const getUnitIndex = (sizes = []) => index => (index > (sizes.length - 1) ? (sizes.length - 1) : index)
    const getResult = sizes => byte => index => `${(byte / Math.pow(1024, index)).toFixed(1)} ${sizes[index]}`
    return compose(compose(compose(getResult, getSizes)(), getByte)(input), compose(compose(getUnitIndex, getSizes)(), getIndex, getByte))(input)
}
