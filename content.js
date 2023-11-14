Promise.all([
    settingsLoaded,
    windowLoaded,
]).then(async () => {
    const togglesObj = createToggles();
    const toggles = Object.values(togglesObj);
    await new Promise(resolve => {
        const observer = new MutationObserver(() => {
            if (!toggles.every(toggle => toggle.buttonEl = document.querySelector(`[role="button"][aria-label$=" + ${toggle.key})" i][data-is-muted]`)))
                return;
            observer.disconnect();
            resolve();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    });
    const preMeetingToggles = toggles.filter((toggle) => {
        const isPreMeeting = toggle.buttonEl.tagName === 'DIV';
        if (isPreMeeting) {
            toggle.onChange((checkboxEl) => {
                if (checkboxEl.checked)
                    toggle.disable();
            });
            toggle.labelStyle = {
                color: 'white',
                position: 'absolute',
                bottom: '0',
                [toggle.direction]: '100px',
                zIndex: '1',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
            };
            toggle.checkboxStyle = {
                cursor: 'pointer',
                margin: '0 4px 0 0',
                position: 'relative',
                top: '1px',
            };
            toggle.buttonEl.parentElement.append(toggle.labelEl);
        }
        if (toggle.autoDisable)
            toggle.disable();
        return isPreMeeting;
    });
    if (preMeetingToggles.length)
        chrome.storage.sync.onChanged.addListener(changes => Object.entries(changes)
            .forEach(([storageName, { newValue }]) => togglesObj[storageName].checked = newValue));
    const originalPageTitle = document.title;
    const observeButtons = () => document.title =
        (togglesObj["disableMic"].disabled ? `${togglesObj["disableMic"].emoji} ` : '') +
            (togglesObj["disableCam"].disabled ? '' : `${togglesObj["disableCam"].emoji} `) +
            originalPageTitle;
    observeButtons();
    const buttonObserver = new MutationObserver(observeButtons);
    toggles.forEach(toggle => buttonObserver.observe(toggle.buttonEl, { attributes: true }));
});
