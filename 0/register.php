<?php
// 检查是否有POST请求
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // 获取表单数据
    $username = $_POST['username'];
    $email = $_POST['email'];
    $password = $_POST['password'];

    // 为了安全起见，这里应该对密码进行加密处理，例如使用password_hash
    // $password = password_hash($password, PASSWORD_DEFAULT);

    // 将数据存储到网站根目录下的users.txt文件中
    $user_data = "Username: $username\nEmail: $email\nPassword: $password\n\n";
    file_put_contents(__DIR__ . '/users.txt', $user_data, FILE_APPEND);

    // 反馈给用户
    echo "注册成功！";
} else {
    // 如果不是POST请求，重定向回注册页面
    header("Location: register.html");
    exit();
}
?>