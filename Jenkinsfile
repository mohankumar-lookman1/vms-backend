pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'secura:lts'
    }

    stages {

        stage('Build and Deploy') {
            steps {
                script {
                    // Build the Docker image
                    docker.build(DOCKER_IMAGE, '-f Dockerfile .')

                    // Run the Docker container
                    docker.run("--name secura-vms -p 3000:3000 -d ${DOCKER_IMAGE}")

                }
            }
        }
    }

    post {
        always {
            // Clean up - stop and remove the Docker container
            script {
                docker.stop('secura-vms')
                docker.remove('secura-vms')
            }
        }
    }
}
