const logout = (req, res) => {
    const cookieOptions = {
        secure: true, // false for local development
        httpOnly: true,
        sameSite: 'None' // 'lax' for local development
    }
    res.clearCookie('utoken', cookieOptions);
    res.status(200).json({
        status: 'success'
    })
}

export default logout;