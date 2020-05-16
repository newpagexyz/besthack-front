const mainContainer = document.getElementById('message-slider');

let currentChatId = -1;

let latestTimestamp = Date.parse('March 7, 2014');

//Функция дял ajax-get запросов, вводится адрес и функция для возврата(необязательно);
function ajax(url, fun = false) {
    var xmlhttp = new XMLHttpRequest();
    var func = fun;
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == XMLHttpRequest.DONE) {
            if (xmlhttp.status == 200) {
                if (func != undefined & func != false) {
                    func(xmlhttp.responseText);
                } else {
                    console.log(xmlhttp.responseText);
                }
            } else {
                if (func != undefined & func != false) {
                    func(xmlhttp.status + ': ' + xmlhttp.statusText);
                } else {
                    console.log(xmlhttp.status + ': ' + xmlhttp.statusText);
                }
            }
        }
    };

    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}

//Функция запроса чатов пользователя (авторизация через cookie)
function get_chats(fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/get_chats.php", fun);
}

function get_users(c, fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/get_users.php?chat=" + c, fun);
}

function push_message(c, text, fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/push_message.php?chat=" + c + "&data=" + text, fun);
}

function get_messages(c, fun, last = false) {
    if (last) {
        ajax("https://besthack.newpage.xyz/ajax_api/get_messages.php?chat=" + c + "&last=" + last, fun);
    } else {
        ajax("https://besthack.newpage.xyz/ajax_api/get_messages.php?chat=" + c, fun);
    }
}

function new_invite_link(c, fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/new_invite_link.php?chat=" + c, fun);
}

function drop_user(c, uid, fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/drop_user.php?chat=" + c + "&uid=" + uid, fun);
}

function user_info_quick(uid, fun) {
    ajax("https://besthack.newpage.xyz/ajax_api/user_info_quick.php?uid=" + uid, fun);
}


class Message {
    constructor(owner, text, timestamp) {
        this.owner = owner;
        this.text = text;
        this.timestamp = timestamp;
    }
}

class User {
    constructor(id, name, surname, avatar) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.avatar = avatar;
    }
}

let users = [];
let gliders = 0;

function appendToSlider(user) {
    if (gliders >= users.length) return;
    gliders++;
    const pers = document.createElement('div');
    pers.className = 'column';
    const persfig = document.createElement('figure');
    persfig.className = 'image is-64x64';
    const image = document.createElement('img');
    image.src = user.avatar;
    image.className = 'is-rounded';
    persfig.append(image);
    pers.append(persfig);
    document.getElementById('glider').append(pers);
    /*if (gliders === users.length) {
        new Glider(document.querySelector('.glider'), {
            slidesToShow: 15,
            draggable: true,
            dots: "#dots ",
            arrows: {
                prev: ".glider-prev ",
                next: ".glider-next "
            }
        });

     */
}

class RecyclerView {

    createNewDivs(maxMessages) {
        for (let i = 0; i < maxMessages; i++) {
            const div = document.createElement('div');
            div.className = 'columns';

            const firstColumn = document.createElement('div');
            firstColumn.className = 'column is-one-fifth';
            const figure = document.createElement('figure');
            figure.className = 'image is-64x64'
            const avatar = document.createElement('img');
            figure.append(avatar);
            avatar.className = 'is-rounded';
            firstColumn.append(figure);

            const secondColumn = document.createElement('div');
            secondColumn.className = 'column';
            const username = document.createElement('p');
            secondColumn.append(username);

            const thirdColumn = document.createElement('div');
            thirdColumn.className = 'column';
            const text = document.createElement('p');
            thirdColumn.append(text);

            this.divs.push(div);
            this.avatars.push(avatar);
            this.texts.push(text);
            this.usernames.push(username);

            div.append(firstColumn);
            div.append(secondColumn);
            div.append(thirdColumn);

            this.container.prepend(div);
        }
    }

    constructor(container, maxMessages) {
        this.container = container;
        this.maxMessages = maxMessages;
        this.messages = [];
        this.pos = 0;

        this.divs = [];
        this.usernames = [];
        this.avatars = [];
        this.texts = [];

        this.createNewDivs(maxMessages);
    }


    render() {
        for (let i = 0; i < Math.min(this.maxMessages, this.messages.length); i++) {
            const ownerId = this.messages[this.pos + i].owner;
            let owner = {};
            let index = 0;
            for (let j = 0; j < users.length; j++) {
                if (users[j].id === ownerId) {
                    owner = users[j];
                    index = j;
                    break;
                }
            }
            if (!(owner.name)) {
                user_info_quick(ownerId, (userdata) => {
                    userdata = JSON.parse(userdata);
                    const user = new User(ownerId, userdata.name, userdata.surname, userdata.image);
                    users[index] = user;
                    this.avatars[this.pos + i].src = userdata['image'];
                    this.texts[this.pos + i].innerText = this.messages[this.pos + i].text;
                    this.usernames[this.pos + i].innerText = userdata.name + this.messages[this.pos + i].timestamp;
                    appendToSlider(user)
                });
            } else {
                this.avatars[this.pos + i].src = users[index].avatar;
                this.texts[this.pos + i].innerText = this.messages[this.pos + i].text;
                this.usernames[this.pos + i].innerText = owner.name + this.messages[this.pos + i].timestamp;
            }
        }
    }


    append(message) {
        this.messages.push(message);
    }

    shift(message) {
        this.messages.unshift(message);
        //this.pos = 0;
        //this.render();
    }

    init() {
        this.container.addEventListener('click', () => {
            //const currentScroll = this.container.scrollTop;
            //if (currentScroll < 10) {
            this.pos += this.maxMessages;
            loadMoreMessages(this.pos);
            return;
            // }
        });
    }
}

function loadUsers() {
    users = [];
    get_users(currentChatId, (res) => {
        res = JSON.parse(res);
        res.forEach(id => {
            users.push(new User(id, null, null, null))
        });
        loadMessages();
    });
}


function loadDialogs() {
    get_chats((res) => {
        const display_chats = document.getElementById('display-chats');
        res = JSON.parse(res);
        res.forEach(chat => {
            const div = document.createElement('div');
            const link = document.createElement('a');
            link.text = chat;
            div.append(link);
            display_chats.append(div);
            link.addEventListener('click', () => {
                currentChatId = link.text;
                loadUsers();
            })
        })
    });
}


let myRecyclerView = new RecyclerView(mainContainer, 10);
myRecyclerView.init();

function loadMoreMessages(pos) {
    get_messages(currentChatId, (res) => {
        res = JSON.parse(res);
        res.forEach(msg => {
            const message = new Message(msg[1], msg[3], msg[2]);
            myRecyclerView.shift(message);
        });

        myRecyclerView.createNewDivs(myRecyclerView.maxMessages);
        myRecyclerView.render();
        myRecyclerView.divs[myRecyclerView.divs.length - 1].scrollIntoView(true);
    }, pos);
}

function loadMessages(render = true) {
    get_messages(currentChatId, (res) => {
        res = JSON.parse(res);
        myRecyclerView.messages = [];
        res.forEach(msg => {
            const message = new Message(msg[1], msg[3], msg[2]);
            myRecyclerView.messages.unshift(message);
        });
        if (render) {
            myRecyclerView.render();
        } else {
            myRecyclerView.messages.forEach(msg => {
                const date = Date.parse(msg.timestamp.replace(' ', 'T'));
                if (date >= latestTimestamp) {
                    myRecyclerView.render();
                    latestTimestamp = date;
                }
            })
        }
    });
}

function reloadMessages() {
    loadMessages(true);
}


function initUi() {
    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', () => {
        const textarea = document.getElementById('textarea');
        push_message(currentChatId, textarea.value, () => {
            reloadMessages();
            textarea.value = '';
        });
    })
}


loadDialogs();
initUi();


let timer = setInterval(() => {
    loadMessages(false);
}, 1000);