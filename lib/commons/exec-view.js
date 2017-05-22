'use babel';
import React from 'react'
import ReactDOM from 'react-dom'
import ResizableBox from 'react-resizable-box'

export default class CommandOutputView extends React.Component {

  constructor() {
    super();
    this.state = {entries: []};
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const customStyle: Object = { overflowY: 'scroll', height: 'inherit' }
    return (
      <ResizableBox isResizable={{ top: true }} height="200" width="auto">
        <div id="command-output" tabIndex="-1" style={customStyle}>
          <div>
            {this.state.entries.map(entry => (
              <div>
                <span className="timestamp">{'[' + entry.timestamp + '] '}</span>
                <span className={entry.type}>{entry.text}</span>
                <br></br>
              </div>
            ))}
          </div>
        </div>
      </ResizableBox>
    );
  }

  /**
   * Saída padrão
   */
  stdout(text) {
    var date = new Date();
    var timestamp = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    this.setState((prevState) => ({
      entries: prevState.entries.concat({
        text: "" + text,
        type: "stdout",
        timestamp: timestamp
      })
    }));
  }

  /**
   * Saída de erro
   */
  stderr(text) {
    var date = new Date();
    var timestamp = date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    this.setState((prevState) => ({
      entries: prevState.entries.concat({
        text: "" + text,
        type: "stderr",
        timestamp: timestamp
      })
    }));
  }

  /**
   * Finaliza a execução
   */
  finish() {

  }

  destroy() {
    this.element.remove();
  }

}
