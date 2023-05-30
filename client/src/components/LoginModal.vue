<template>
  <header>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&display=swap" rel="stylesheet" />
  </header>

  <div v-if="isOpen" class="overlay">
    <div class="modal">
      <div class="modal_header">
        <h1>Welcome in Baristana!</h1>
        <p>To access the chat feature, please log in.</p>
        <img src="@/assets/images/logo.svg" alt="Baristana Logo" class="logo" />
      </div>
      <div class="modal_body">
        <button
          id="customBtn"
          class="login_button"
          @mouseover="buttonHover"
          @mouseleave="buttonNormal"
          @mousedown="buttonPress"
          @mouseup="buttonNormal"
        ></button>
      </div>
      <button class="close_button" @click="closeModal">&#10005;</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  methods: {
    closeModal() {
      console.log('Emitting close event');
      this.$emit('close');
    },
    buttonHover() {
      this.buttonState = 'focus';
    },
    buttonNormal() {
      this.buttonState = 'normal';
    },
    buttonPress() {
      this.buttonState = 'pressed';
    },
    startApp() {
      gapi.load('auth2', () => {
        // Retrieve the singleton for the GoogleAuth library and set up the client.
        auth2 = gapi.auth2.init({
          client_id: 'YOUR_CLIENT_ID.apps.googleusercontent.com',
          cookiepolicy: 'single_host_origin'
          // Request scopes in addition to 'profile' and 'email'
          // scope: 'additional_scope'
        });
        this.attachSignin(document.getElementById('customBtn'));
      });
    },
    attachSignin(element) {
      auth2.attachClickHandler(
        element,
        {},
        googleUser => {
          this.username = googleUser.getBasicProfile().getName();
          console.log('Signed in: ' + this.username);
        },
        function (error) {
          alert(JSON.stringify(error, undefined, 2));
        }
      );
    }
  },
  data() {
    return {
      username: '',
      buttonState: 'normal'
    };
  }
};
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(52, 52, 52, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  width: 42%;
  height: 62%;
  overflow: hidden;
  border-radius: 20px;
  margin-top: 6%;
  display: flex;
  flex-direction: column;
}

.modal_header {
  position: relative;
  background-color: #efece0;
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}

h1 {
  margin-top: 7%;
  margin-bottom: 3%;
  font-family: 'Abril Fatface', cursive;
  color: #1a1f39;
  font-weight: normal;
  font-size: 1.9rem;
}

p {
  font-weight: 300;
  font-size: 0.8rem;
  line-height: 1.5;
  display: inline-block;

  color: #e29d3c;
}

.modal_body {
  background-color: #fff;
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  width: 25%;
  height: auto;
  position: absolute;
  bottom: 0.5%;
  right: 0.5%;
}

.login_button {
  width: 190px;
  height: 46px;
  border: none;
  cursor: pointer;
  background-repeat: no-repeat;
  background-size: 100% 100%;
}

.login_button {
  /* Apply the normal state image. */
  background-image: url('@/assets/images/btn_google_signin_light_normal_web@2x.png');
}

.login_button:hover {
  /* Apply the focus state image. */
  background-image: url('@/assets/images/btn_google_signin_light_focus_web@2x.png');
}

.login_button:active {
  /* Apply the pressed state image. */
  background-image: url('@/assets/images/btn_google_signin_light_pressed_web@2x.png');
}
.close_button {
  position: absolute;
  top: 0.3%;
  right: 0.3%;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #979797;
  color: #f4f2f0;
  font-size: 1.2em;
  font-weight: 100;
  line-height: 30px;
  text-align: center;
  border: none;
  cursor: pointer;
}
</style>
