const input = document.getElementById('user-input');
const sendBtn = document.getElementById('send-button');
const messageList = document.getElementById('message-list');
const hero = document.getElementById('hero');
const chatArea = document.getElementById('chat-area');
const workspace = document.getElementById('workspace-container');
const body = document.getElementsByClassName('body')[0];
const learningButton = document.getElementById('learning-button');
const tagItems = document.querySelectorAll('.tag-item');
const stopBtn = document.querySelectorAll('#stop-button')[0];


let lastUserMsg = null;
let thinking = null;

let userMSGs = document.querySelectorAll(".user-msg");

