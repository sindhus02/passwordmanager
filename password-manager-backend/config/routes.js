module.exports = (app) => {

    var db
    const MongoClient = require('mongodb').MongoClient

    const ObjectId = require('mongodb').ObjectId
    const aes256 = require('aes256')
    const jwt = require('jsonwebtoken')
    
    MongoClient.connect(process.env.DB_URL, (err, database) => {
    
        if (err) return console.log(err)
        db = database.db('password-manager')
    })

    app.get('/', (req, res) => {
        res.send('Simple Password Manager by Kamran Fekri')
    })

    /**
     * User
     *  Create User: (Post) /user/
     *  Get User: (Get) /user/:id
     *  Login: (Put) /user/login
     *  Logout: (Put) /user/logout
     *  Delete User: (Delete) /user/:id/delete
     */

    app.post('/user', async (req, res) => {
        
        const users = await db.collection('users')
        const email = req.body.email

        //check if email is already in use
        if(await users.findOne({email}) !== null){
            res.status(400)
            res.send({message: 'Email already in use.', status: 400})
            return
        }

        if(req.body.name == undefined || req.body.password == undefined || req.body.questions == undefined){
            return res.status(400).send({ message: 'Missing parameters', status: 400})
        }

        const name = req.body.name
        const password = req.body.password
        const questions = req.body.questions
        const questionsString = JSON.stringify(questions).toLowerCase().replace(/ /g, '')

        //this key will be used to encrypt passwords
        const key = randomString(32, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')

        //Store these hashes in db
        const hashFromPassword = aes256.encrypt(password, key)
        const hashFromQuestions = aes256.encrypt(questionsString, key)
        const loginValidationHash = aes256.encrypt(password, 'true')

        const user = {
            name,
            email,
            hashFromPassword,
            hashFromQuestions,
            loginValidationHash,
            accounts: {}
        }

        users.insertOne(user)
            .then(result => {
                //jwt token
                const token = jwt.sign({ id: result.insertedId, key }, process.env.JWT_TOKEN_KEY, {expiresIn: 86400});
                res.send({
                    status: 200,
                    message: "New account created succesfully.",
                    id: result.insertedId,
                    token
                })
            })
            .catch(error => {
                console.log(error)
                res.send({
                    status: 500,
                    error: error
                })
            })
    })

    app.get('/user/:id', async (req, res) => {

        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
        

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })

            const users = await db.collection('users')
    
            if(!ObjectId.isValid(req.params.id)){
                res.status(400)
                res.send({message: 'Invalid user id.'})
                return
            }
    
            const id = new ObjectId(req.params.id)
            const user = await users.findOne(id)
    
            if(user === null || user === undefined){
                res.status(404)
                res.send({message: 'User not found.'})
            } else {
                res.send({user})
            }
        })

    })

    app.get('/user', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            //get user
            const id = new ObjectId(decoded.id)
            const user = await users.findOne(id)

            return res.status(200).send({ user })
        })
    })

    app.get('/jwt/', async (req, res) => {
        
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })
        

        jwt.verify(token, process.env.JWT_TOKEN_KEY, function(err, decoded) {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            res.send({decoded})
        })
            
    })

    app.put('/user/login', async (req, res) => {

        const users = await db.collection('users')
        const email = req.headers.email
        const password = req.headers.password

        if(email == undefined) return res.status(401).send({ auth: false, message: 'No email provided.' })

        const user = await users.findOne({email: email.toLowerCase()})

        if(user === null || user === undefined){
            res.status(401)
            res.send({message: 'Email or password did not match.', status: 401})
            return
        }

        const passwordIsValid = aes256.decrypt(password, user.loginValidationHash)

        if(passwordIsValid == 'true'){
            const key = aes256.decrypt(password, user.hashFromPassword)
            const token = jwt.sign({ id: user._id, key }, process.env.JWT_TOKEN_KEY, {expiresIn: 86400});
            res.send({id: user._id, token})
        } else {
            res.status(401)
            res.send({message: 'Email or password did not match.', status: 401})
        }
    })

    app.put('/user/:id/logout', (req, res) => {
        //TODO
    })

    app.delete('/user/:id/delete', async (req, res) => {

        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
          
            if(!ObjectId.isValid(req.params.id)){
                res.status(400)
                res.send({message: 'Invalid user id.'})
                return
            }
    
            const id = new ObjectId(req.params.id)
            let result = await users.deleteOne({"_id": id})
    
            if(result.result.n > 0){
                res.send({message: 'User has been deleted.'})
            } else {
                res.status(404)
                res.send({message: 'User not found.'})
            }

        })
    })

    app.delete('/user', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            //get user
            const id = new ObjectId(decoded.id)
            let result = await users.deleteOne({"_id": id})
    
            if(result.result.n > 0){
                res.send({message: 'User has been deleted.'})
            } else {
                res.status(404)
                res.send({message: 'User not found.'})
            }
        })
    })

    /**
     * Accounts
     *  Add Account: (Post) /account/
     *  Get Account: (Get) /account/:id
     *  Get All Accounts: (Get) /accounts
     *  Delete Account: (Delete) /account/:id/delete
     */

    app.post('/account', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            //add account
            const account = req.headers.account
            const password = req.headers.password

            if(account == undefined) return res.status(400).send({ message: 'Missing account.' })

            //get user
            const id = new ObjectId(decoded.id)
            const user = await users.findOne(id)

            //updating user
            user.accounts[account.toLowerCase()] = aes256.encrypt(decoded.key, password)

            //update user
            users.update(
                {email: user.email},
                user,
                { upsert: true }
            )

            return res.status(200).send({ message: 'The account has been saved' })

        })
    })

    app.get('/accounts', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            //get user
            const id = new ObjectId(decoded.id)
            const user = await users.findOne(id)

            return res.status(200).send({ accounts: Object.keys(user.accounts)})
        })
    })

    app.get('/account/:account', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            const account = req.params.account

            //get user
            const id = new ObjectId(decoded.id)
            const user = await users.findOne(id)

            //get account
            if(user.accounts.hasOwnProperty(account)){

                const hash = user.accounts[account]
                const password = aes256.decrypt(decoded.key, hash)
                return res.status(200).send({ account, password })

            } else {
                return res.status(404).send({ message: 'Account not found' })
            }
        })
    })

    app.delete('/account/:account/delete', async (req, res) => {
        
        const users = await db.collection('users')
        const token = req.headers['x-access-token']
        if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' })

        jwt.verify(token, process.env.JWT_TOKEN_KEY, async (err, decoded) => {
            if (err) return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' })
            
            const account = req.params.account

            //get user
            const id = new ObjectId(decoded.id)
            const user = await users.findOne(id)

            //get account
            if(user.accounts.hasOwnProperty(account)){

                //delete account
                delete user.accounts[account]
                            
                //update user
                users.update(
                    {email: user.email},
                    user,
                    { upsert: true }
                )

            return res.status(200).send({ message: 'The account has been delete' })

            } else {
                return res.status(404).send({ message: 'Account not found' })
            }

        })
    })

}

const randomString = (length, chars) => {
    var result = ''
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)]
    return result
}