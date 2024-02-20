const passport = require('passport')
const local = require('passport-local')
const jwt = require('passport-jwt')
const GithubStrategy = require('passport-github2')
const User = require('../DAO/models/user.model')
const cookieExtractor = require('../utils/cookie-extractor.util')
const { jwtSecret } = require('../configs/index')
const { createHash } = require('../utils/crypt-password.util')
const { ghClientID, ghClientSecret } = require('.')

const JWTStrategy = jwt.Strategy
const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest:jwt.ExtractJwt.fromExtractors([cookieExtractor]),
        secretOrKey: jwtSecret,
    }, (jwt_payload, done) => {
        try {
            done(null, jwt_payload)
        } catch (error) {
            done(error)
        }
    }))

    passport.use('register', new LocalStrategy(
        {passReqToCallback: true, usernameField: 'email'},
        
        async(req, username, password, done) => {
            try {
                const { first_name, last_name, email } = req.body
                const user = await User.findOne({email: username})
                if(user){
                    console.log('User Exists')
                    return done(null, false)
                }
                
                const newUserInfo = {
                    first_name, 
                    last_name, 
                    email, 
                    password: createHash(password)
                }
    
                const newUser = await User.create(newUserInfo)
    
                return done(null, newUser)

            } catch (error) {
                return done(error)
            }
        }
    ))

    passport.use('github', new GithubStrategy({
        clientID: ghClientID,
        clientSecret: ghClientSecret,
        callbackURL: 'http://localhost:8080/api/auth/githubcallback'
    },
    async (accessToken, RefreshToken, profile, done) => {
        try {
            const { id, login, name, email } = profile._json
            
            const user = await User.findOne({email: email})
            if(!user){
                const newUserInfo = {
                    first_name: name,
                    email,
                    githubId: id,
                    githubUsername: login
                }
                const newUser = await User.create(newUserInfo)

                return done(null, newUser)
            }
                
            return done(null, user)

        } catch (error) {
            console.log(error)
            done(error)
        }
    }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = User.findById(id)
        done(null, user)
    })
}

module.exports = initializePassport