import jwt from 'jsonwebtoken'

const SECRET = 'super-secret-key' // put in .env later!

export function signToken(user: any) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        SECRET,
        { expiresIn: '7d' }
    )
}