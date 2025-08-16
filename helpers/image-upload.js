const multer = require("multer");
const path = require("path");

// destino da imagem
const imageStorage = multer.diskStorage({ // configuração de uploud de imagem
  destination: function (req, file, cb) {
    let folder = "";

    console.log(req)

    if (req.baseUrl.includes('users')) {
      folder = "users";
    } else if (req.baseUrl.includes('pets')) {
      folder = "pets";
    }
    cb(null, `public/images/${folder}/`);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));// nome + data do arquivo
  },
});

const imageUpload = multer({
  storage: imageStorage,
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|JPG)$/)) { // só aceita png ou jpg
      // upload only png and jpg format
      return cb(new Error("Por favor, envie apenas png ou jpg!"));
    }
    cb(undefined, true);
  },
});

module.exports = { imageUpload };
