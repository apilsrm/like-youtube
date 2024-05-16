const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
} //promise ma 2 ota huncha resolve r reject (or catch)


export { asyncHandler } //to handle promise 


/*
1)const asyncHandler = () => {}
2)const asyncHandler = (func) => {
    () => {

    }
   
}
//same ho 
const asyncHandler = (func) => () => {}// to pass it  more function  of fraction

3) const asyncHandler = (func) =>async (req, res, next) => {} //it becomes async function

*/

// to handle try catch 
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }