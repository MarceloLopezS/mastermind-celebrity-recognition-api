const incrementEntry = (req, res, next) => {
    if (!req.authorizedUser) {
        return res.status(403).json({
            status: 'unauthorized'
        })
    }

    // Increment user entries
    return res.status(200).json({
        status: 'success'
    })
}

export default incrementEntry;