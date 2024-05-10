module.exports = {
    port: 4000,
    database:{
        host:'localhost',
        user:'root',
        password: '',
        database:'shorturls'
    },
    jwtConfig:{
        jwtSecret:'keep_it_secret',
        jwtExpiration:'2h'
    }
}