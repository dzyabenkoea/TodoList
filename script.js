const menuButton = document.querySelector('#projects-menu')
menuButton.addEventListener('click', () => {
    const project = document.querySelector('#project-window')
    project.classList.add('show')
    console.log('clicked')
})