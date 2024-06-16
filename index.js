import express from 'express';
import path from 'path';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const app = express();
const host = '0.0.0.0';
const port = 3000;

let listaInteressado = [];
let listaPet = [];
let listaAdotar = [];

app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'MinH4Ch4v3S3cr3t4',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 30 }
}));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'publico')));

// Middleware para autenticação
function usuarioEstaAutenticado(req, res, next) {
    if (req.session.usuarioAutenticado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

// Funções de manipulação de dados
function cadastrarInteressado(req, res) {
    const { nome, email, telefone } = req.body;
    listaInteressado.push({ nome, email, telefone });
    res.redirect('/protegido/listarInteressado.html');
}

function cadastrarPet(req, res) {
    const { nome, raca, idade } = req.body;
    listaPet.push({ nome, raca, idade });
    res.redirect('/protegido/listarPet.html');
}

function adotarPet(req, res) {
    const { interessado, pet } = req.body;
    listaAdotar.push({ interessado, pet });
    res.redirect('/protegido/listarAdotar.html');
}

function autenticaUsuario(req, res) {
    const { usuario, senha } = req.body;
    if (usuario === 'admin' && senha === '1234') {
        req.session.usuarioAutenticado = true;
        res.cookie('dataUltimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        res.redirect('/');
    } else {
        res.send('Usuário ou senha inválidos!');
    }
}

// Rotas
app.post('/login', autenticaUsuario);

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login.html');
});

app.use(usuarioEstaAutenticado, express.static(path.join(process.cwd(), 'protegido')));

app.post('/cadastrarInteressado', usuarioEstaAutenticado, cadastrarInteressado);
app.post('/cadastrarPet', usuarioEstaAutenticado, cadastrarPet);
app.post('/adotarPet', usuarioEstaAutenticado, adotarPet);

// Rotas para listagem
app.get('/listarInteressado', usuarioEstaAutenticado, (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Lista de Interessados</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h1>Lista de Interessados</h1>
                <table class="table table-striped">
                    <tr><th>Nome</th><th>Email</th><th>Telefone</th></tr>
                    ${listaInteressado.map(int => `
                        <tr>
                            <td>${int.nome}</td>
                            <td>${int.email}</td>
                            <td>${int.telefone}</td>
                        </tr>`).join('')}
                </table>
                <a href="/">Voltar</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/listarPet', usuarioEstaAutenticado, (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Lista de Pets</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h1>Lista de Pets</h1>
                <table class="table table-striped">
                    <tr><th>Nome</th><th>Raça</th><th>Idade</th></tr>
                    ${listaPet.map(pet => `
                        <tr>
                            <td>${pet.nome}</td>
                            <td>${pet.raca}</td>
                            <td>${pet.idade}</td>
                        </tr>`).join('')}
                </table>
                <a href="/">Voltar</a>
            </div>
        </body>
        </html>
    `);
});

app.get('/listarAdotar', usuarioEstaAutenticado, (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Lista de Adoções</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container">
                <h1>Lista de Adoções</h1>
                <table class="table table-striped">
                    <tr><th>Interessado</th><th>Pet</th></tr>
                    ${listaAdotar.map(adotar => `
                        <tr>
                            <td>${adotar.interessado}</td>
                            <td>${adotar.pet}</td>
                        </tr>`).join('')}
                </table>
                <a href="/">Voltar</a>
            </div>
        </body>
        </html>
    `);
});

// Inicia o servidor
app.listen(port, host, () => {
    console.log(`Servidor rodando em http://${host}:${port}`);
});
