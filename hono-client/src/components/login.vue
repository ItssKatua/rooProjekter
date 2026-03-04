<template>
    <div class="window-body">
        <h4>Welcome back to <b>CommSat</b></h4>
        <br>
        <form>

            <div class="field-row-stacked">
                <label for="text18">Username</label>
                <input id="text18" type="text" />
            </div>
            <div class="field-row-stacked">
                <label for="text19">Password</label>
                <input id="text19" type="text" />
            </div>
            <br>
            <div class="field-row">
                <button class="default" formaction="submit">Submit</button>
                <button>Cancel</button>
                <button>Register</button>
            </div>
        </form>
    </div>
</template>

<script setup>

</script>

<style>
.windowLogin{
    top: 400px;
    left: 500px;
    width: 320px;
    z-index: 200;
}
</style>