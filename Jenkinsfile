pipeline {
    agent any

    environment {
        SONARQUBE_ENV = 'sonarqube'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Check Node') {
            steps {
                sh '''
                whoami
                which node
                which npm
                node -v
                npm -v
                '''
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Install Server Dependencies') {
            steps {
                dir('server') {
                    sh 'npm install'
                }
            }
        }

        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'sonarqube_scanner'
            }
            steps {
                withSonarQubeEnv('sonarqube_server') {
                    sh '''
                    ${scannerHome}/bin/sonar-scanner \
                    -Dsonar.projectKey=project-management \
                    -Dsonar.projectName=project-management \
                    -Dsonar.sources=frontend/src,server \
                    -Dsonar.exclusions=**/node_modules/**,**/dist/**,**/build/** \
                    -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                    '''
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }

        failure {
            echo 'Pipeline failed.'
        }
    }
}
