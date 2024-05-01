const checkUserAuthentication = (req, res) => {
  if (!req.authorizedUser) return res.status(200).json({
    authenticated: false
  })

  return res.status(200).json({
    authenticated: true
  })
}

export default checkUserAuthentication