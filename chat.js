const mainContainer = document.getElementById('message-slider');


class Message {
    constructor(owner, text, avatarUrl) {
        this.owner = owner;
        this.text = text;
        this.avatar = avatarUrl;
    }
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
            const text = document.createElement('p');
            secondColumn.append(text);

            this.divs.push(div);
            this.avatars.push(avatar);
            this.texts.push(text);

            div.append(firstColumn);
            div.append(secondColumn);

            this.container.prepend(div);
        }
    }

    constructor(container, maxMessages) {
        this.container = container;
        this.maxMessages = maxMessages;
        this.messages = [];
        this.pos = 0;

        this.divs = [];
        this.avatars = [];
        this.texts = [];

        this.createNewDivs(maxMessages);
    }


    render() {
        for (let i = 0; i < Math.min(this.maxMessages, this.messages.length); i++) {
            this.avatars[this.pos + i].src = this.messages[this.pos + i].avatar;
            this.texts[this.pos + i].innerText = this.messages[this.pos + i].text;
        }
    }


    append(message) {
        this.messages.push(message);
        this.render();
        this.divs[this.divs.length - 1].scrollIntoView(true);
    }

    shift(message) {
        this.messages.unshift(message);
        this.render();
        this.divs[0].scrollIntoView(true);
    }

    init() {
        this.container.addEventListener('scroll', () => {
            const currentScroll = this.container.scrollTop;
            if (currentScroll < 10) {
                this.pos += this.maxMessages;
                //this.divs[this.divs.length - 1].scrollIntoView(true);
                this.createNewDivs(this.maxMessages);
                this.render();
                return;
            }
        });
    }

}

function testMessages(recycler) {
    for (let i = 0; i < 100; i++) {
        const msg = new Message('kek', 'животноводство важнейшая отрасль народного хозяйства' + i,
            'avatar.jpg');
        recycler.append(msg);
    }
    recycler.render();
}


const myRecyclerView = new RecyclerView(mainContainer, 10);
myRecyclerView.init();

function initUi() {
    const submitButton = document.getElementById('submit');
    submitButton.addEventListener('click', () => {
        const textarea = document.getElementById('textarea');
        myRecyclerView.shift(new Message('host', textarea.value.slice(), 'avatar.jpg'));
        textarea.value = '';
    })
}
testMessages(myRecyclerView);
initUi();