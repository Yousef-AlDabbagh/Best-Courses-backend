const { isValidObjectId } = require('mongoose');
const passwordResetToken = require('../models/passwordResetToken'); 
const { sendError } = require('../utils/helper');

exports.isValidPassResetToken = async (req,res,next) =>{

    const {token , userId } = req.body;
   
    if( !token.trim() || !isValidObjectId(userId)) return sendError(res,'Invalid request!')
   
    const resetToken = await passwordResetToken.findOne({owner: userId})
    if(!resetToken) return sendError(res,'Unauthorized access, Invalid request!')
    
    const matched = await resetToken.compareToken(token)
    if(!matched)return sendError(res,'Unauthorized access, Invalid request!')

    req.resetToken= resetToken;
    // if the token is matched the next will move to the next controller
    next()

}