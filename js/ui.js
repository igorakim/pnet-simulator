var STATUS_LOCKED = false;

function set_status(text) {
    if (!STATUS_LOCKED) {
        document.getElementById("status_bar").innerHTML = text;
    }
}

function lock_status(text) {
    STATUS_LOCKED = true;
}

function unlock_status(text) {
    STATUS_LOCKED = false;
}
