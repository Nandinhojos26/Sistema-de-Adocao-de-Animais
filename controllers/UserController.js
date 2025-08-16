const User = require('../models/User')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
// helpers
const createUserToken = require('../helpers/create-user-token')
const getToken = require('../helpers/get-token')
const getUserByToken = require('../helpers/get-user-by-token')

module.exports = class UserController{
    static async register(req, res){
        const name = req.body.name
        const email = req.body.email
        const phone = req.body.phone
        const password = req.body.password
        const confirmpassword = req.body.confirmpassword


        // validações

        if (!name) {
            res.status(422).json({ message: 'O nome é obrigatório!' })
            return
        }

        if (!email) {
        res.status(422).json({ message: 'O e-mail é obrigatório!' })
        return
        }

    if (!phone) {
      res.status(422).json({ message: 'O telefone é obrigatório!' })
      return
    }

    if (!password) {
      res.status(422).json({ message: 'A senha é obrigatória!' })
      return
    }

    if (!confirmpassword) {
      res.status(422).json({ message: 'A confirmação de senha é obrigatória!' })
      return
    }

    if (password != confirmpassword) {
      res
        .status(422)
        .json({ message: 'A senha e a confirmação precisam ser iguais!' })
      return
    }
        // checar usuarios

        const userExists = await User.findOne({email: email})

        if (userExists) {
            res.status(422).json({ message: 'Por favor, utilize outro e-mail!' })
            return
        }

        // criação de senha

        const salt = await bcrypt.genSalt(12) // criptografia da senha
        const passwordHash = await bcrypt.hash(password,salt)

        // criação do usuario

        const user = new User({
            name,
            email,
            phone,
            password: passwordHash,
        })

        try{  
            const newUser = await user.save()
            await createUserToken(newUser,req, res)
             
        }catch(error){
            res.status(500).json({message: error})
        }

    }

    static async login(req, res){
        const {email, password} = req.body

        if (!email) {
        res.status(422).json({ message: 'O e-mail é obrigatória!' })
        return
        }

        if (!password) {
        res.status(422).json({ message: 'A senha é obrigatória!' })
        return
        }
        // checar usuarios

        const user = await User.findOne({email: email})

        if (!user) {
            res.status(422).json({ message: 'Não há úsuario cadastrado com esse email' })
            return
        }

        // checar senha é valida

        const checkPassword = await bcrypt.compare(password, user.password)

        if(!checkPassword){
            res.status(422).json({ message: 'Senha inválida' })
            return
        }

         await createUserToken(user,req, res)
    }

    static async checkUser(req, res){

        let currentUser

        if(req.headers.authorization){

            const token = getToken(req)
            const decoded = jwt.verify(token, 'nossosecret')

            currentUser =await User.findById(decoded.id)

            currentUser.password = undefined

        }else{
            currentUser = null
        }

        res.status(200).send(currentUser)
    }

    static async getUserById(req, res){

        const id = req.params.id

        const user = await User.findById(id).select('-password') // busca o dado do id e remove a senha

        if(!user){
            res.status(422).json({ message: 'Usuário não encontrado' })
            return
        }

        res.status(200).json({user})
    }

    static async editUser(req, res){
        const id= req.params.id

         // checa se usruario existe
         const token = getToken(req)
        const user = await getUserByToken(token)


        const{name, email, phone, password, confirmpassword} = req.body


        if(req.file){
            user.image = req.file.filename
        }

        // validações

            if (!name) {
                res.status(422).json({ message: 'O nome é obrigatório!' })
                return
            }

            if (!email) {
            res.status(422).json({ message: 'O e-mail é obrigatório!' })
            return
            }

            // checa se o email já não esta cadastrado
            const userExists = await User.findOne({email: email})

            if(!user.email !== email && userExists){
                res.status(422).json({ message: 'Por favor, use outro e-mail' })
                return
            }

            user.email = email


            if (!phone) {
            res.status(422).json({ message: 'O telefone é obrigatório!' })
            return
            }

            user.phone = phone

            if(password != confirmpassword){
                res.status(422).json({message: 'As senhas não confere'})
            }else if(password === confirmpassword && password != null){

                // cria nova senha
                const salt = await bcrypt.genSalt(12) // criptografia da senha
                const passwordHash = await bcrypt.hash(password,salt)

                user.password = passwordHash

            }

            try {
                 await User.findOneAndUpdate(
                    {_id: user._id},
                    {$set: user},
                    {new: true},
                )

                res.status(200).json({message: 'Usuário atualizado com sucesso'})
            } catch (err) {
                res.status(500).json({message: err})
            }



    }
}  