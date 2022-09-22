import './index.css'
import {v4 as uuidv4} from 'uuid'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './projects.css'
import './tasks.css'

const ProjectManager = (function () {

    let currentProject = null
    let projects = []

    const Renderer = (function () {

        function projectList() {
            let html = ''
            projects.forEach(project => {
                html += `
                <li class="project-list-element" data-project-id=${project.id}>
                    <p class="project-text">${project.name}</p>
                    <button type="button" class="remove-button">
                    <i class="remove-icon bi bi-trash-fill"></i>
                    </button>
                </li>`
            })
            return html
        }

        function renderProjects() {
            const projWindow = document.querySelector('#project-list')
            projWindow.innerHTML = projectList()
        }

        const tests = function () {
            const _tests = [function test_render() {
                addProject('adfasdfasdf', 'adfasdfasdf')
                console.assert(projects.length === document.querySelectorAll('[data-project-id]').length)
            }]
            return {
                run: () => {
                    _tests.forEach(test => test())
                }
            }
        }()

        return {renderProjects, tests}
    })()


    function projectsCount() {
        return projects.length
    }

    function getProject(id) {
        let project = projects.find(el => el.id === id)
        if (project === undefined)
            project = null
        return project
    }

    function addProject(name, id = uuidv4()) {
        const project = {id, name, isFinished: false, tasks: []}
        projects.push(project)
        Renderer.renderProjects()
        currentProject = project
        return project
    }

    function removeProject(id) {
        projects = projects.filter(el => el.id !== id)
        Renderer.renderProjects()
    }

    const tests = (function () {
        const _tests = [
            function test_addProject() {
                projects = []
                const oldLength = projectsCount()
                addProject('Проект для добавления', '123')
                console.assert(projectsCount() === oldLength + 1)
                removeProject('123')
            },
            function test_removeProject() {
                projects = []
                addProject('123', 'Проект для удаления')
                removeProject('123')
                console.assert(getProject('123') === null)
            },
            function test_getProject() {
                projects = []
                addProject('Noname', '123')
                const project = getProject('123')
                console.assert(project !== null)
                removeProject('123')
            },
            function test_renderAddedProject() {
                projects = []
                addProject('123', 'Наименование')
            }
        ]

        function run() {
            Renderer.tests.run()
            _tests.forEach(test => {
                test()
            })
        }

        return {run}
    })()

    const TaskManager = (function () {

        function addTask(projectId, id = uuidv4(), title, dueDate) {
            const task = {id, title, dueDate}
            getProject(projectId).tasks.push(task)

            // render
            let html = ``

            const projectRelatedTasks = getProject(currentProject.id).tasks

            projectRelatedTasks.forEach(task => {
                html += `
                <div class="task">
                    <input type="checkbox">
                    <p class="task-text">${task.title}</p>
                </div>`
            })

            const taskList = document.querySelector('#task-list')
            taskList.innerHTML = html

            return task
        }

        function removeTask(projectId, taskId) {
            const project = getProject(projectId)
            project.tasks = project.tasks.filter(task => task.id !== taskId)
        }

        function getTask(projectId, taskId) {
            const project = getProject(projectId)
            project.tasks = project.tasks.find(task => task.id === taskId)
        }

        const tests = (function () {
            const _tests = [
                function test_addTask() {
                    const project = addProject('Проект 1', undefined)
                    const task = addTask(project.id, '123', 'Новая задача')
                    console.assert(getProject(project.id).tasks.find(el => el.id === task.id))
                }
            ]

            function run() {
                _tests.forEach(test => test())
            }

            return {run}
        })()

        return {addTask, removeTask, tests}
    })()

    return {
        addProject,
        removeProject,
        tests: {
            run() {
                tests.run()
                TaskManager.tests.run()
            }
        }
    }

})
()

const ModelMapper = (function () {

    function mapAddProject() {
        const button = document.querySelector('#add-project-button')
        button.addEventListener('click', event => {
            ProjectManager.addProject(uuidv4(), uuidv4())
        })
    }

    function mapRemove() {
        const projectList = document.querySelector('#project-list')
        projectList.addEventListener('click', event => {
            const button = event.target.closest('.remove-button')
            if (button !== null) {
                const task = button.closest('.project-list-element')
                ProjectManager.removeProject(task.dataset.projectId)
            }
        })
    }

    function mapFinished() {
        const taskList = document.querySelector('#task-list')
        taskList.addEventListener('click', (event) => {
            const projectElements = event.target.closest('.task')
            ProjectManager.markAsFinished(projectElements.dataset.taskId)
        }, true)
    }

    mapFinished()
    mapRemove()
    mapAddProject()

    return {}

})()

ProjectManager.tests.run()
