let users = [];

axios.get('http://localhost:3000/getallusers').then((result, err) => {
    console.log(result.data);
    users = result.data;
});

let joinRoom = (e) => {
    e.preventDefault();
    const input_tag = document.getElementById("username");
    console.log(input_tag.value);
    let flag = true;
    users.forEach(user => {
        if (user.username === input_tag.value) {
            alert(`${input_tag.value} already exists in the chat`);
            flag = false;
        }
    });

    if (flag) {
        document.location.href = `chat.html?username=${input_tag.value}&room=${document.getElementById("room").value}`;
    }
}