const Auth = (req, res, next) => {
    console.log(req.cookies.isLoggedIn)
    if (req.cookies.isLoggedIn === 'true') {
      next()
    } 
    else{
      console.log('failed to addAproduct: ' )
      res.send({ success: false, message: 'Unsuccessful' })
    }
  }
  module.exports = Auth