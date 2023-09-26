export default function createIdRoom() {
    // on veut un id de 8 caractères
    let idRoom = "";
    let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < 8; i++) {
        idRoom += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return idRoom;
}