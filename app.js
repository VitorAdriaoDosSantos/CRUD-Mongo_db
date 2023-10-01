const express = require("express")
const app = express()
const handlebars = require("express-handlebars")
const bodyParser = require("body-parser")
const path = require("path")
const mongoose = require("mongoose")
require("./models/Post")
const Postagens = mongoose.model("postagem")
const flash = require("connect-flash")
const session = require("express-session")
const multer = require("multer")
const { get } = require("http")
mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/postcrud").then(() => {
    console.log("conectado com sucesso")
}).catch((err) => {
    console.log("erro:" + err)
})

app.use(express.static("upload"))
app.use(express.static(path.join(__dirname, "public")))
app.engine("handlebars", handlebars.engine({ defaultLayout: "main" }))
app.set("view engine", "handlebars")
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash())

app.use(session({
    secret:"nodejs",
    resave: true,
    saveUninitialized: true
}))
app.use((req,res,next)=>
{
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    next()
})

app.get("/", (req, res,) => {
    Postagens.find().lean().then((Postagem) => {

        res.render("index", { Postagem: Postagem })
    }).catch(() => {
        req.flash("error_msg","Ouve um erro ao listar o Post-card")
        res.redirect("/cadastrarPost")
    })
})
app.get("/cadastrarPost", (req, res) => {
    res.render("formulario")
})
app.get("/editpost/:id", (req, res) => {
    Postagens.findOne({ _id: req.params.id }).lean().then((postagem) => {
        res.render("editpost", { postagem: postagem })
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao editar o Post-card")
    })
})
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const uploads = multer({ storage: storage })

app.post("/Data", uploads.single('image'), (req, res) => {

    const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        comentario: req.body.comentario,
        image: req.file.filename
    }
    new Postagens(novaPostagem).save().then(() => {
        req.flash("success_msg","Post-card criado com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg","Erro ao cria Post-card, post não cadastrado!")
        res.redirect("/cadastrarPost")
    })
})

app.post("/updatePost", (req, res) => {
 

    Postagens.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.descricao = req.body.descricao
        postagem.comentario = req.body.comentario

            postagem.save().then(() => {
                req.flash("success_msg","Post-card atualizado com sucesso!")
                res.redirect("/")
            }).catch((err) => {
                req.flash("error_msg","Ouve um erro ao atualizar o Post-card")
            })
    })
})
app.post("/deletapost", (req, res) => {
    Postagens.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg","Post-card deletado com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao excluir o Post-card")
    })
})

app.get("/viewpostweb/:id", (req, res) => {
    Postagens.findOne({ _id: req.params.id }).lean().then((Postagem) => {
        res.render("viewpost", { Postagem: Postagem })
    }).catch((err) => {
        req.flash("error_msg","Ouve um erro ao mostra o Post-card")
    })
})

const PORT = 1010
app.listen(PORT, function () {
    console.log("rodando")
})