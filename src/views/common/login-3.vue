<template>
  <div class="login-container">
    <div class="login-weaper animated bounceInDown">
      <div class="login-logo">
        <!-- 可放公司Logo -->
      </div>
      <p class="login-tip">易创网站管理平台-中电科版</p>

      <div class="login-border">
        <div class="login-main">
          <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form">
            <el-form-item prop="username">
              <el-input
                v-model="loginForm.username"
                type="text"
                auto-complete="off"
                placeholder="账号"
              >
                <svg-icon slot="prefix" icon-class="user" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                auto-complete="off"
                placeholder="密码">
                <svg-icon slot="prefix" icon-class="password" class="el-input__icon input-icon" />
              </el-input>
            </el-form-item>
            <el-form-item prop="code">
              <el-input
                v-model="loginForm.captcha"
                auto-complete="off"
                placeholder="验证码"
                style="width: 56%">
                <svg-icon slot="prefix" icon-class="validCode" class="el-input__icon input-icon" />
              </el-input>
              <div class="login-code">
                <img :src="codeUrl" @click="getCaptcha()" class="login-code-img" />
              </div>
            </el-form-item>
            <el-checkbox v-model="loginForm.rememberMe" style="margin:0px 0px 25px 0px;">记住密码</el-checkbox>
            <el-form-item style="width:100%;">
              <el-button
                :loading="loading"
                size="medium"
                type="primary"
                style="width:100%;" @click="handleLogin()">
                <span v-if="!loading">登 录</span>
                <span v-else>登 录 中...</span>
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <!--  底部  -->
    <div class="el-login-footer">
      <span>Copyright © 2017-2020 e-chuang.vip All Rights Reserved.</span>
    </div>
  </div>
</template>

<script>
import { getUUID } from "@/utils";

export default {
  name: "Login",
  data() {
    return {
      codeUrl: "",
      loginForm: {
        username: "admin",
        password: "admin123",
        rememberMe: false,
        uuid: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", message: "密码不能为空" },
        ],
        captchaPath: [
          { required: true, trigger: "change", message: "验证码不能为空" },
        ],
      },
      loading: false,
      redirect: undefined,
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  created() {
    this.getCookie();
    this.getCaptcha();
  },
  
  methods: {
    // 获取验证码
    getCaptcha() {
      this.loginForm.uuid = getUUID();
      this.codeUrl = this.$http.adornUrl(
        `/captcha?uuid=${this.loginForm.uuid}`
      );
    },
    getCookie() {
      const username = this.$cookie.get("username");
      const password = this.$cookie.get("password");
      const rememberMe = this.$cookie.get("rememberMe");
      this.loginForm = {
        username: username === undefined ? this.loginForm.username : username,
        password: password === undefined ? this.loginForm.password : password,
        rememberMe: rememberMe === undefined ? false : Boolean(rememberMe),
      };
    },

    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          // if (this.loginForm.rememberMe) {
          //   this.$cookie.set("username", this.loginForm.username, {
          //     expires: 30,
          //   });
          //   this.$cookie.set("password", this.loginForm.password, {
          //     expires: 30,
          //   });
          //   this.$cookie.set("rememberMe", this.loginForm.rememberMe, {
          //     expires: 30,
          //   });
          // } else {
          //   this.$cookie.delete("username");
          //   this.$cookie.delete("password");
          //   this.$cookie.delete("rememberMe");
          // }

          this.$http({
            url: this.$http.adornUrl("/sys/login"),
                method: "post",
                data: this.$http.adornData({
                username: this.loginForm.username,
                password: this.loginForm.password,
                uuid: this.loginForm.uuid,
                captcha: this.loginForm.captcha,
                }),
            })
            .then(({ data }) => {
              if (data && data.code === 200) {
                this.$cookie.set("token", data.token);
                console.log("0k");
                this.$router.replace({ name: 'home' })
                //this.$router.push({ name: "home" });
              } else {
                this.getCaptcha();
                this.$message.error(data.msg);
                this.loading = false;
              }

            })
            .catch(() => {
              this.loading = false;
              this.getCaptcha();
            });
        }
      });
    },
  },
};
</script>

<style rel="stylesheet/scss" lang="scss">
.login-container {
  background-color: #f0f2f5;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  -webkit-animation: animate-cloud 20s linear infinite;
  animation: animate-cloud 20s linear infinite;
}
.login-weaper {
  position: relative;
  margin: 0 auto;
  width: 380px;
  padding: 0 40px;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  -webkit-box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  box-shadow: 0 7px 25px rgba(0, 0, 0, 0.08);
  background-color: #fff;
  border-radius: 3px;
}
@media screen and (max-width: 992px) {
  .login-weaper {
    margin: 0 auto;
    width: 96% !important;
  }
}

.bounceInDown {
  -webkit-animation-name: bounceInDown;
  animation-name: bounceInDown;
}
.animated {
  -webkit-animation-duration: 1s;
  animation-duration: 1s;
  -webkit-animation-fill-mode: both;
  animation-fill-mode: both;
}

.login-border,
.login-main {
  width: 100%;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.login-border {
  border-left: none;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  color: #fff;
  background-color: #fff;
  float: left;
}

.login-border,
.login-left {
  padding: 20px 0 40px 0;
  position: relative;
  -webkit-box-align: center;
  -ms-flex-align: center;
  align-items: center;
  display: -webkit-box;
  display: -ms-flexbox;
  display: flex;
}

.login-main {
  margin: 0 auto;
}

/** Title区域 */
.login-title {
  color: #333;
  margin-bottom: 30px;
  font-weight: 500;
  font-size: 22px;
  text-align: center;
  letter-spacing: 4px;
}

/** Logo区域 */
.login-logo {
  overflow: hidden;
  width: 110px;
  height: 110px;
  margin: -50px auto 20px auto;
  border-radius: 50%;
  /** -webkit-box-shadow: 0 4px 40px rgba(0,0,0,.07);
    box-shadow: 0 4px 40px rgba(0,0,0,.07);
    padding: 10px;
    background-color: #fff;
    z-index: 1;
    position: relative;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    */
  padding: 20px;
}

@media screen and (max-width: 992px) {
  .login-logo {
    padding-top: 30px !important;
    margin-left: -30px;
  }
}

.login-form {
  margin: 10px 0;
}


.login-tip {
  font-size: 16px;
  text-align: center;
  color: #000000;
}

.login-code {
  height: 38px;
  float: right;
  img {
    cursor: pointer;
    vertical-align: middle;
  }
}
.el-login-footer {
  height: 40px;
  line-height: 40px;
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: center;
  color: #000000;
  font-family: Arial;
  font-size: 12px;
  letter-spacing: 1px;
}
.login-submit {
  width: 100%;
  height: 45px;
  font-size: 18px;
  letter-spacing: 5px;
  text-indent: 5px;
  font-weight: 300;
  font-weight: 600;
  cursor: pointer;
  margin-top: 30px;
  font-family: neo;
  -webkit-transition: 0.25s;
  transition: 0.25s;
}
</style>