const AudioManager = (function() {
    let bgmAudio = null;
    let isMuted = false;

    function initBGM() {
        if (!bgmAudio) {
            bgmAudio = new Audio('bgm/bgm.mp3');
            bgmAudio.loop = true; // 設置循環播放
            bgmAudio.volume = 0.5; // 設置音量為 50%
        }
    }

    function playBGM() {
        if (!bgmAudio) {
            initBGM();
        }
        
        // 由於瀏覽器的自動播放政策，我們需要處理播放失敗的情況
        const playPromise = bgmAudio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("BGM autoplay prevented:", error);
            });
        }
    }

    function stopBGM() {
        if (bgmAudio) {
            bgmAudio.pause();
            bgmAudio.currentTime = 0;
        }
    }

    function toggleMute() {
        if (bgmAudio) {
            isMuted = !isMuted;
            bgmAudio.muted = isMuted;
        }
        return isMuted;
    }

    function setVolume(volume) {
        if (bgmAudio) {
            bgmAudio.volume = Math.max(0, Math.min(1, volume));
        }
    }

    return {
        initBGM,
        playBGM,
        stopBGM,
        toggleMute,
        setVolume
    };
})(); 