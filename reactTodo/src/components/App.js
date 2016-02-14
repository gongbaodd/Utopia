'use strict';
import React from "react";
import LocalDb from "localDb";
import TodoHeader from "./TodoHeader.js";
import TodoMan from "./TodoFooter.js";

class App extends React.Component {
    constructor(){
        super();
        this.db = new LocalDb('React-Todos');
        this.state = {
            todos: this.db.get("todos") || [],
            isAllChecked: false
        };
    }

    allChecked(){
        let isAllChecked = false;
        if (this.state.todos.every((todo)=> todo.isDone)) {
            isAllChecked = true;
        }
        this.setState({
            todos: this.state.todos,
            isAllChecked
        });
    }

    addTodo(todoItem) {
        this.state.todos.push(todoItem);
        this.allChecked();
        this.db.set('todos', this.state.todos);
    }

    changeTodoState() {
        
    }
}
