const logout = (req, res) => {
    res.clearCookie('utoken');
    res.status(200).json({
        status: 'success'
    })
}

export default logout;