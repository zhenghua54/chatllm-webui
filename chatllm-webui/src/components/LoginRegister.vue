<template>
  <div class="login-register-container">
    <div class="form-container" v-if="isLoginVisible">
      <h2>登录</h2>
      <form @submit.prevent="onLogin">
        <div class="form-group">
          <label for="loginUsername">用户名:</label>
          <input type="text" id="loginUsername" v-model="login.username" required>
        </div>
        <div class="form-group">
          <label for="loginPassword">密码:</label>
          <input type="password" id="loginPassword" v-model="login.password" required>
        </div>
        <button type="submit" class="btn login">登录</button>
        <!-- 添加导航到注册表单的链接 -->
        <p class="toggle-form">没有账号？<a href="#" @click="toggleForm(false)">注册</a></p>
      </form>
    </div>

    <div class="form-container" v-if="!isLoginVisible">
      <h2>注册</h2>
      <form @submit.prevent="onRegister">
        <div class="form-group">
          <label for="registerUsername">用户名:</label>
          <input type="text" id="registerUsername" v-model="register.username" required>
        </div>
        <div class="form-group">
          <label for="registerEmail">邮箱:</label>
          <input type="email" id="registerEmail" v-model="register.email" required>
        </div>
        <div class="form-group">
          <label for="registerPassword">密码:</label>
          <input type="password" id="registerPassword" v-model="register.password" required>
        </div>
        <button type="submit" class="btn register">注册</button>
        <!-- 添加导航到登录表单的链接 -->
        <p class="toggle-form">已有账号？<a href="#" @click="toggleForm(true)">登录</a></p>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login: {
        username: '',
        password: '',
      },
      register: {
        username: '',
        email: '',
        password: '',
      },
      isLoginVisible: true,
    };
  },
  methods: {
    onLogin() {
      // 执行登录逻辑
      if (this.$route.query.role === 'user') {
        this.$emit('login-success', this.login.username);
      }
      else if (this.$route.query.role === 'admin') {
        this.$emit('login-success-admin', this.login.username);
      }
      // 示例: 发送登录请求...
      this.$router.push('/')
    },
    onRegister() {
      // 执行注册逻辑
      console.log('注册', this.register);
      // 示例: 发送注册请求...
    },
    toggleForm(isLogin) {
      this.isLoginVisible = isLogin;
    },
  },
};
</script>

<style>
.login-register-container {
  display: flex;
  justify-content: space-around;
  padding: 20px;
  flex-wrap: wrap;
  gap: 20px;
}

.form-container {
  width: 300px;
  padding: 25px;
  background: #f7f7f7;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-group input:focus {
  border-color: #007bff;
  outline: none;
}

.btn {
  display: block;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 4px;
  color: #fff;
  background-color: #007bff;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn.login {
  background-color: #28a745;
}

.btn.login:hover {
  background-color: #218838;
}

.btn.register {
  background-color: #007bff;
}

.btn.register:hover {
  background-color: #0069d9;
}



.toggle-form {
  margin-top: 20px;
  text-align: center;
  font-size: 0.9rem;
}

.toggle-form a {
  color: #007bff;
  cursor: pointer;
}
</style>