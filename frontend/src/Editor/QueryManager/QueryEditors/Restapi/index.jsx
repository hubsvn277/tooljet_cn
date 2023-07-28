import 'codemirror/theme/duotone-light.css';

import React from 'react';
import { isEmpty, defaults } from 'lodash';
import Tabs from './Tabs';
import Select from '@/_ui/Select';
import { changeOption } from '../utils';
import { CodeHinter } from '../../../CodeBuilder/CodeHinter';
import { BaseUrl } from './BaseUrl';
import { queryManagerSelectComponentStyle } from '@/_ui/Select/styles';

class Restapi extends React.Component {
  constructor(props) {
    super(props);
    const options = defaults(
      { ...props.options },
      { headers: [], url_params: [], body: [], json_body: null, body_toggle: false }
    );
    this.state = {
      options,
    };
  }

  componentDidMount() {
    try {
      if (isEmpty(this.state.options['headers'])) {
        this.addNewKeyValuePair('headers');
      }
      setTimeout(() => {
        if (isEmpty(this.state.options['url_params'])) {
          this.addNewKeyValuePair('url_params');
        }
      }, 1000);
      setTimeout(() => {
        if (isEmpty(this.state.options['body'])) {
          this.addNewKeyValuePair('body');
        }
      }, 1000);
    } catch (error) {
      console.log(error);
    }
  }

  onBodyToggleChanged = (value) => {
    const { options } = this.state;
    options['body_toggle'] = value;
    this.setState({ options }, () => {
      this.props.optionsChanged(options);
    });
  };

  addNewKeyValuePair = (option) => {
    const { options } = this.state;
    const newOptions = { ...options, [option]: [...options[option], ['', '']] };

    this.setState({ options: newOptions }, () => {
      this.props.optionsChanged(newOptions);
    });
  };

  removeKeyValuePair = (option, index) => {
    const { options } = this.state;
    options[option].splice(index, 1);

    this.setState({ options }, () => {
      this.props.optionsChanged({ ...options, arrayValuesChanged: true });
    });
  };

  keyValuePairValueChanged = (value, keyIndex, option, index) => {
    const { options } = this.state;
    const prevValue = options[option][index][keyIndex];
    options[option][index][keyIndex] = value;

    this.setState({ options }, () => {
      this.props.optionsChanged({ ...options, arrayValuesChanged: prevValue !== value });
    });
  };

  handleJsonBodyChanged = (jsonBody) => {
    const { options } = this.state;
    options['json_body'] = jsonBody;

    this.setState({ options }, () => {
      this.props.optionsChanged(options);
    });
  };
  // 处理粘贴浏览器标头
  handlePaste = (paramType, inputText, setInputText) => {
    const { options } = this.state;
    if (/:\n/.test(inputText)) {
      inputText = inputText.replaceAll(':\n', ':')
    }
    if(inputText.length===0) return;
    if (confirm('确定添加这些标头吗？\r\n' + inputText) == true) {
      var lines = inputText.split('\n')
      var parseLines = []
      parseLines = lines.map(l => l.split(':').map(x => x.trim()))
      options[paramType] = parseLines;
      this.setState({ options }, () => {
        this.props.optionsChanged(options);
      });
      setInputText('')
    } 
  }

  handleChange = (key, keyIndex, idx) => (value) => {
    const lastPair = this.state.options[key][idx];
    if (this.state.options[key].length - 1 === idx && (lastPair[0] || lastPair[1])) this.addNewKeyValuePair(key);
    this.keyValuePairValueChanged(value, keyIndex, key, idx);
  };

  customSelectStyles = (darkMode, width) => {
    return {
      ...queryManagerSelectComponentStyle(darkMode, width),
      control: (provided) => ({
        ...provided,
        boxShadow: 'none',
        backgroundColor: darkMode ? '#2b3547' : '#F1F3F5',
        borderRadius: '6px 0 0 6px',
        height: 32,
        minHeight: 32,
        borderColor: darkMode ? 'inherit' : ' #D7DBDF',
        borderWidth: '1px',
        '&:hover': {
          backgroundColor: darkMode ? '' : '#F8F9FA',
        },
        '&:active': {
          backgroundColor: darkMode ? '' : '#F8FAFF',
          borderColor: '#3E63DD',
          boxShadow: '0px 0px 0px 2px #C6D4F9 ',
        },
        cursor: 'pointer',
      }),
    };
  };

  render() {
    const { options } = this.state;
    const dataSourceURL = this.props.selectedDataSource?.options?.url?.value;
    const queryName = this.props.queryName;

    const currentValue = { label: options.method?.toUpperCase(), value: options.method };

    return (
      <div>
        <div className="rest-api-methods-select-element-container">
          <div className={`${this.props.darkMode && 'dark'}`} style={{ width: '90px', height: '32px' }}>
            <Select
              options={[
                { label: 'GET', value: 'get' },
                { label: 'POST', value: 'post' },
                { label: 'PUT', value: 'put' },
                { label: 'PATCH', value: 'patch' },
                { label: 'DELETE', value: 'delete' },
              ]}
              onChange={(value) => {
                changeOption(this, 'method', value);
              }}
              value={currentValue}
              defaultValue={{ label: 'GET', value: 'get' }}
              placeholder="请求方式"
              width={100}
              height={32}
              styles={this.customSelectStyles(this.props.darkMode, 91)}
              useCustomStyles={true}
            />
          </div>

          <div className={`col field w-100 d-flex rest-methods-url ${this.props.darkMode && 'dark'}`}>
            {dataSourceURL && (
              <BaseUrl theme={this.props.darkMode ? 'monokai' : 'default'} dataSourceURL={dataSourceURL} />
            )}
            <div className="col">
              <CodeHinter
                initialValue={options.url}
                theme={this.props.darkMode ? 'monokai' : 'default'}
                onChange={(value) => {
                  changeOption(this, 'url', value);
                }}
                placeholder="输入请求URL"
                componentName={`${queryName}::url`}
                mode="javascript"
                lineNumbers={false}
                height={'32px'}
              />
            </div>
          </div>
        </div>

        <div className={`query-pane-restapi-tabs  ${this.props.darkMode ? 'dark' : ''}`}>
          <Tabs
            theme={this.props.darkMode ? 'monokai' : 'default'}
            options={this.state.options}
            onChange={this.handleChange}
            onJsonBodyChange={this.handleJsonBodyChanged}
            removeKeyValuePair={this.removeKeyValuePair}
            addNewKeyValuePair={this.addNewKeyValuePair}
            darkMode={this.props.darkMode}
            componentName={queryName}
            bodyToggle={this.state.options.body_toggle}
            setBodyToggle={this.onBodyToggleChanged}
            handlePaste={this.handlePaste}
          />
        </div>
      </div>
    );
  }
}

export { Restapi };
