import React, { Component } from 'react';

interface TruncateTextProps {
    text: string;
    maxLength: number;
}

interface TruncateTextState {
    truncatedText: string;
}

class TruncateText extends Component<TruncateTextProps, TruncateTextState> {
    constructor(props: TruncateTextProps) {
        super(props);
        this.state = {
            truncatedText: this.truncateText(props.text, props.maxLength)
        };
    }

    truncateText = (text: string, maxLength: number): string => {
        if (text.length <= maxLength) {
            return text;
        }
        const halfLength = maxLength / 2;
        const start = text.slice(0, halfLength - 1);
        const end = text.slice(-halfLength + 1);
        return `${start}...${end}`;
    };

    render() {
        return <span title={this.props.text}>{this.state.truncatedText}</span>;
    }
}

export default TruncateText;
