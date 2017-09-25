After performing this assignment the students will fulfill the three goals described in the course syllabus:

* Describe a web browsers different internal components and their interactions including browser security mechanisms
* Create web applications were JavaScript, HTML and CSS have clear roles and are clearly separated
* Store and with asynchronous communication, transfer data with for the task appropriate data format

This examination is worth 3 credit (3hp).

## The quiz application

This examination will focus on asynchronous communication agains an external [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) web services through AJAX.
The backend (server-side code) of this assignment will be given and your job is to write the client-side code.

## Deadline and submission
Deadline: 9 / 12 12.00
Submit: Submit your assignment by doing a release on GitHub named "v1.0". In case of changes after a released version please use incremental version numbers, i.e. "v1.1", "v1.22 etc.

## Preperation
Do the excercises at least the on A and B level.
Read the chapters in the book for this part.
Use Git to clone down your examination-repo. It should be something like
```
git clone https://github.com/1dv022/xx222xx-examination-2.git
```
Pull down the files from our examination repo (be sure to do this in the right directory)
```
git pull https://github.com/1dv022/examination-2.git
```
This repo should include a VagrantFile with the same stuff that you have been used in the exercises.
Then start writing your code in this repo and do your commits as usually.

##Notice
Any attempt to plagiarism or other way of cheating will be reported to the university discipline board


## About the assignment
The student should create an client application in which the user can answer, by the server given, quiz-questions. The user must do this in a certain time. Do the user give the correct answer will the application take the user to the next question. Does the user give the wrong answer or didn´t the user answer in time the quiz is over.

The student is responsible for the presentation of the questions, the handling of the client application logic and the user interface. The user shouldn't have any problem to understand the UI. Keep it simple, keep it beautiful.

At the start of the game the user should be able to write a nickname she/he wants in the quiz game. The game must have a timer that gives the user a maximum of 20 seconds to answer each question. If the user doesn´t answer during the time or the user answer wrong its a game over and the user should be able to start over the game.

If the user answer all the questions with correct answers. The game should check the the total time the user took to be able to save this in a high-score list with the 5 fastest times. The high-score will be saved in the browsers Web Storage.

### The questions and answers
The questions will be public to the client application through a RESTful Web API. The first question (startpoint of the application) is at the URL:
```
http://vhost3.lnu.se:20080/question/1
```
You can find the source code of the server at the GitHub repo:
```
https://github.com/thajo/AjaxAssignment
```
, that is if you are interested in running the server by you self [optional, but good training].

The response of the API will tell you what kind of question you should show to the user and where to send the answers. In other word, you have to analyze the response from the server to know how to display the questions and how to send new requests for answering the questions. Hyperlink is provided by the server response in a RESTful way. The server responses will also give clues about what HTTP-methods to use and how to send the answers back.

The server will put out two different types of questions. Simple text questions and questions with alternatives where the user should answer with the right key "alt1", "alt2" ect. You can watch the server responses and decide what is what.

The last questions answer will not return any new link to a new question and that means that the quiz is over.

### Finishing up
Create a release tag at github to indicate that you are ready for examination. Book a time for oral exam.

## Requirements
* The client application must be written in vanilla javascript, no libraries like JQuery.
* It should be easy for the user to understand the application and how to use it to take the quizes.
* The application must be able to handle the different type of questions/answers that the server provide/handle
* For ever question there should be a timer counting down from 20s to 0s
* The client application should also keep track of the total time the user takes to answer all the questions.
* The user should be able to choose a nickname at the start of the game that will be used in the high-score list.
* Application should use Web Storage to store a high-score list which presents the 5 fastest total times at the end of the game. At least nickname and total time should be present.

## Tips
Before you start writing code think about:
* How to present the question the user should answer?
* How to get the answer from the user and how to send it back to the server?
* Be sure to tell the server that the POST-request is in "application/json" by setting the "Content-type" of the HTTP-header (check up [the XMLHttpRequest object](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest) and setRequestHeader)

Good luck!
