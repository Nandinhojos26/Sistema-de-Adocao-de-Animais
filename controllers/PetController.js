const Pet = require('../models/Pet')

//helpers

const getToken = require("../helpers/get-token")
const getUserBytoken = require("../helpers/get-user-by-token")
const ObjectId = require('mongoose').Types.ObjectId

module.exports = class PetController{
    static async create(req, res){
        
        const {name, age, weight, color } = req.body
        const images = req.files
        const available = true

        // images upload


        // validadçoes

    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório!' })
      return
    }

    if (!age) {
      res.status(422).json({ message: 'A idade é obrigatória!' })
      return
    }

    if (!weight) {
      res.status(422).json({ message: 'O peso é obrigatório!' })
      return
    }

    if (!color) {
      res.status(422).json({ message: 'A cor é obrigatória!' })
      return
    }
    
    if (images.length  === 0) {
      res.status(422).json({ message: 'A imagem é obrigatória!' })
      return
    }


    // pega usuario

    const token = getToken(req)
    const user = await getUserBytoken(token)
      // criar o pet

    const pet = new Pet({
        name,
        age,
        weight,
        color,
        available,
        images: [],
        user: {
            _id: user._id,
            name: user.name,
            image: user.image,
            phone: user.phone,

        }
    })


    images.map((image) =>{
        pet.images.push(image.filename)
    })

    try {
        const newPet = await pet.save()
        res.status(201).json({message: 'Pet cadastrado com sucesso', newPet,})
    } catch (err) {
        res.status(500).json({message: err})
    }

    }

    // ordenar
    static async getAll(req, res) {
        const pets = await Pet.find().sort('-createdAt') // ordenanr pets

        res.status(200).json({ pets: pets, })
  
    }

    // pets do usuario
  static async getAllUserPets(req, res) {
    // get user
    const token = getToken(req)
    const user = await getUserBytoken(token)

    const pets = await Pet.find({ 'user._id': user._id }).sort('-createdAt')

    res.status(200).json({
      pets,
    })
  }

  // pets que adotei
  static async getAllUserAdoptions(req, res) {
    // get user
    const token = getToken(req)
    const user = await getUserBytoken(token)

    const pets = await Pet.find({ 'adopter._id': user._id }).sort('-createdAt')

    res.status(200).json({
      pets,
    })
  }

    static async getPetById(req, res) {
    const id = req.params.id

    // id valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'ID inválido!' })
      return
    }

    // pet existente
    const pet = await Pet.findOne({ _id: id })

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' })
      return
    }

    res.status(200).json({
      pet: pet,
    })
  }
    // remover o pet
  static async removePetById(req, res) {
    const id = req.params.id

    // checa se id é valido
    if (!ObjectId.isValid(id)) {
      res.status(422).json({ message: 'ID inválido!' })
      return
    }

    // checa se pets existem
    const pet = await Pet.findOne({ _id: id })

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' })
      return
    }

    // registro dos pets
    const token = getToken(req)
    const user = await getUserBytoken(token)

    if (pet.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          'Houve um problema em processar sua solicitação, tente novamente mais tarde!',
      })
      return
    }

    await Pet.findByIdAndDelete(id)

    res.status(200).json({ message: 'Pet removido com sucesso!' })
  }

    // update a pet
  static async updatePet(req, res) {
    const id = req.params.id
    const name = req.body.name
    const age = req.body.age
    const description = req.body.description
    const weight = req.body.weight
    const color = req.body.color
    const images = req.files
    const available = req.body.available

    const updateData = {}

    // checa os pets existentes
    const pet = await Pet.findOne({ _id: id })

    if (!pet) {
      res.status(404).json({ message: 'Pet não encontrado!' })
      return
    }

    // checa se o usuario tem registro
    const token = getToken(req)
    const user = await getUserBytoken(token)

    if (pet.user._id.toString() != user._id.toString()) {
      res.status(404).json({
        message:
          'Houve um problema em processar sua solicitação, tente novamente mais tarde!',
      })
      return
    }

    // validations
    if (!name) {
      res.status(422).json({ message: 'O nome é obrigatório!' })
      return
    } else {
      updateData.name = name
    }

    if (!age) {
      res.status(422).json({ message: 'A idade é obrigatória!' })
      return
    } else {
      updateData.age = age
    }

    if (!weight) {
      res.status(422).json({ message: 'O peso é obrigatório!' })
      return
    } else {
      updateData.weight = weight
    }

    if (!color) {
      res.status(422).json({ message: 'A cor é obrigatória!' })
      return
    } else {
      updateData.color = color
    }

    if (!images) {
      res.status(422).json({ message: 'A imagem é obrigatória!' })
      return
    } else {
      updateData.images = []
      images.map((image) => {
        updateData.images.push(image.filename)
      })
    }

    

    updateData.description = description

    await Pet.findByIdAndUpdate(id, updateData)

    res.status(200).json({ pet: pet, message: 'Pet atualizado com sucesso!' })
  }
  
  // Marcar visita
  static async schedule(req, res) {
    const id = req.params.id

    // checa se existente
    const pet = await Pet.findOne({ _id: id })

    // checa se o usuario é o dono do pet
    const token = getToken(req)
    const user = await getUserBytoken(token)

    console.log(pet)

    if (pet.user._id.equals(user._id)) {
      res.status(422).json({
        message: 'Você não pode agendar uma visita com seu próprio Pet!',
      })
      return
    }
    // verifica se já tem visita agendada
    
    if (pet.adopter) {
      if (pet.adopter._id.equals(user._id)) {
        res.status(422).json({
          message: 'Você já agendou uma visita para este Pet!',
        })
        return
      }
    }

    // adicionar usuario como adotante do pet
    pet.adopter = {
      _id: user._id,
      name: user.name,
      image: user.image,
    }

    console.log(pet)

    await Pet.findByIdAndUpdate(pet._id, pet)

    res.status(200).json({
      message: `A visita foi agendada com sucesso, entre em contato com ${pet.user.name} no telefone: ${pet.user.phone}`,
    })
  }
}