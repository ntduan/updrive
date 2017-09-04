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
    border-top-color: hsl(171, 100%, 41%);
    border-bottom-color: hsl(171, 100%, 41%);
    animation: spinner .8s ease infinite;
  }
</style>