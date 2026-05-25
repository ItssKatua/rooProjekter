import jwt from 'jsonwebtoken'
import { JWT_SECRET } from './services/authService.ts'

const SECRET = 'super-secret-key' // put in .env later!

export function signToken(user: any) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}