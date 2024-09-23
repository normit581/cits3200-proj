class MyOverlay {
    constructor() {
        this.intervalId = null;
        this.progress = 0;
    }
    // complete the progress, set to 100%, and hide the overlay
    completeProgress() {
        const self = this;
        setTimeout(function () {
            clearInterval(self.intervalId);
            self.updateProgress(100);
            $('#progress-overlay').fadeOut(); // small delay before closing
        }, 500);
    }
    // start simulating progress with random increments
    startProgress(intervalInSeconds) {
        const self = this;
        self.resetProgress();
        if (self.intervalId) {
            clearInterval(this.intervalId); // clear any existing interval
        }
        $('#progress-overlay').fadeIn();

        self.intervalId = setInterval(function () {
            // random increment progress (1-5%)
            const randomIncrement = Math.floor(Math.random() * 5) + 1;
            self.progress = Math.min(self.progress + randomIncrement, 99); // up to 99%
            self.updateProgress(self.progress);
        }, intervalInSeconds * 1000);
    }
    // reset the progress to 0
    resetProgress() {
        this.progress = 0;
        this.updateProgress(0);
    }
    // update progress
    updateProgress(currentProgress) {
        $('#progress').css('width', currentProgress + '%');
        $('#progress-text').text(currentProgress + '%');
    }
}