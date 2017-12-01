<template>
  <div class="spinner"></div>
</template>

<style>
@keyframes spinner {
  to {
    transform: rotate(360deg);
  }
}

.spinner:before {
  content: '';
  box-sizing: border-box;
  position: absolute;
  top: 50%;
  left: 50%;
  width: 30px;
  height: 30px;
  margin-top: -15px;
  margin-left: -15px;
  border-radius: 50%;
  border: 2px solid transparent;
  border-top-color: #33b5ff;
  border-bottom-color: #33b5ff;
  animation: spinner 0.8s ease infinite;
}
</style>