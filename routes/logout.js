const logout = (req, res, next) => {
    res.clearCookie('utoken');
    res.status(200).json({
        status: 'success'
    })
}

export default logout;