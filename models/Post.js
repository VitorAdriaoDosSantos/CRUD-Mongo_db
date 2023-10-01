const mongoose = require("mongoose")
const post = mongoose.Schema

const Postagem = new post({
    titulo:{
        type:String,
        required:true
    },
    descricao:{
        type:String,
        reuqired:true
    },
    image:{
        type:String,
        required:true
    },
    comentario:{
        type:String,
        required:true
    },
    date:{
        type:Date,
        default: Date.now()
    }

})
mongoose.model("postagem",Postagem,"postagem")