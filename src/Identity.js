// @flow

import * as React from 'react';

type Props = {
  apiClient: Object, // opt-out of type checker until Flow types are exported for APIClient
  executionResult: {},
  onChange: (string, ?string) => mixed,
  openLaw: Object, // opt-out of type checker
  savedValue: string,
  variable: {},
};

type State = {
  email: string,
  validationError: boolean,
};

export class Identity extends React.Component<Props, State> {
  openLaw = this.props.openLaw;

  state = {
    email: '',
    validationError: false,
  };

  constructor(props: Props) {
    super(props);

    const self: any = this;
    self.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    try {
      if (this.props.savedValue) {
        const identity = this.openLaw.checkValidity(this.props.savedValue);
        this.setState({
          email: this.openLaw.getIdentityEmail(identity),
          validationError: false,
        });
      } else {
        this.setState({
          email: '',
          validationError: false,
        });
      }
    } catch (ex) {
      this.setState({
        email: '',
        validationError: false,
      });
    }
  }

  onChange(event: SyntheticEvent<HTMLInputElement>) {
    const eventValue = event.currentTarget.value;

    try {
      if (!eventValue) {
        this.setState({
          validationError: false,
          email: eventValue,
        }, () => {
          this.props.onChange(this.openLaw.getName(this.props.variable), '');
        });
      } else {
        this.setState({
          email: eventValue,
          validationError: false,
        });

        this.props.onChange(
          this.openLaw.getName(this.props.variable),
          this.openLaw.createIdentityInternalValue('', eventValue),
        );

        this.props.apiClient.getUserDetails(eventValue).then(result => {
          if (result.email) {
            this.props.onChange(
              this.openLaw.getName(this.props.variable),
              this.openLaw.createIdentityInternalValue(result.id, result.email),
            );

            this.setState({
              email: result.email,
              validationError: false,
            });
          }
        });
      }
    } catch (error) {
      this.setState({
        email: eventValue,
        validationError: true,
      });
    }
  }

  componentDidUpdate() {
    try {
      if (this.props.savedValue) {
        const identity = this.openLaw.checkValidity(
          this.props.variable,
          this.props.savedValue,
          this.props.executionResult,
        );

        if (!this.state.email) {
          this.setState({
            email: this.openLaw.getIdentityEmail(identity),
          });
        }
      }
    } catch (error) {
      // TODO actually handle error
      // eslint-disable-next-line no-undef
      console.error(error);
    }
  }

  render() {
    const variable = this.props.variable;
    const cleanName = this.openLaw.getCleanName(variable);
    const description = this.openLaw.getDescription(variable);
    const additionalClassName = this.state.validationError
      ? 'is-danger-new'
      : '';

    return (
      <div className="contract_variable identity">
        <label>
          <span>{description}</span>

          <input
            className={`input ${cleanName}-email ${additionalClassName}`}
            onChange={this.onChange}
            placeholder={description}
            title={description}
            type="text"
            value={this.state.email}
          />
        </label>
      </div>
    );
  }
}