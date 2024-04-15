




function isLoggedIn(req, res, next) {
  if (req.session && req.session.user) {
    return next()
  }
  res.redirect('/')
}

function isAdminLoggedIn(req, res, next) {
  if (req.session && req.session.admin) {
    return next()
  }
  res.redirect('/admin')
}



module.exports = {
  isLoggedIn,
  isAdminLoggedIn
}