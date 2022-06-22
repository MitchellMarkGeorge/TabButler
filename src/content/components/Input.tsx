import styled from '@emotion/styled'

export const Input = styled.input`
    width: 100%;
    background-color: transparent;
    height: 40px;
    border: none;
    /* border: 1px solid rgba(255, 255, 255, 0.36); */
    /* border-radius: 10px; */
    color: #F7FAFC;
    /* padding-inline: 16px; */
    /* font-size: 16px; */
    font-size: 24px;
    flex: none;

    ::placeholder {
        color: rgba(255, 255, 255, 0.36);
    }

    :focus {
        outline: none;
    }
`;