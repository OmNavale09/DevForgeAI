import './index.css'
const NewsItem = (props) => {
    const {news} = props
    return (
        <li className='news-item'>
            <h2 className='news-head'>{news.title}</h2>
            <p className='news-description'>{news.description}</p>
        </li>   
    )
}

export default NewsItem