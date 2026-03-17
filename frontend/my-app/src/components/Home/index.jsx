import {useState,useEffect} from 'react'
import NavBar from '../NavBar'
import './index.css'
import NewsItem from '../NewsItem'

const dummyNews = [ 
    {
        id: 1,
        title: '🚀 The Rise of "Agentic" Development',
        description: 'Apple’s Xcode 26.3: Just released with integrated Agentic Coding Support, allowing developers to describe high-level features while the IDE independently handles multi-file changes and dependency updates.Anthropic’s Claude Code: Now being integrated into CI/CD pipelines as a "virtual teammate" that can not only suggest code but also run tests and fix its own bugs before a human even sees the Pull Request.'
    },
    {
        id: 2,
        title: '☁️ Cloud 3.0: Sovereign & Hybrid Maturity',
        description: 'Data Residency: Driven by strict global regulations, major providers (AWS, Azure, GCP) have launched "Geopatriation" tools. These allow developers to lock workloads into specific regional hardware without losing the benefits of global serverless scaling.FinOps is Mandatory: With 32% of cloud budgets reported as "wasted" last year, new AI-driven FinOps tools are now standard in Kubernetes environments, automatically right-sizing clusters in real-time based on predictive traffic.'
    },
    {
        id: 3,
        title: '🛠️ Languages & Frameworks Update',
        description: 'Java 25 Release: The latest Long-Term Support (LTS) version has officially hit the market, introducing "Stability Engineering" features designed to compete with Rusts memory safety while maintaining legacy compatibility. Rust’s Mainstream Surge: Major tech firms are reporting that over 40% of new systems-level code is now written in Rust, primarily to meet new sustainability and energy-efficiency targets (GreenOps).Python 3.14 (Preview): Early benchmarks show massive performance gains in the "Global Interpreter Lock" (GIL) removal project, making Python a much stronger contender for high-concurrency backend tasks.'
    },
    {
        id: 4,
        title: '🛡️ Security & Quality',
        description: 'Confidential Computing: Is no longer niche. Gartner reports that 75% of cloud data is now processed in trusted execution environments (TEEs), requiring developers to understand "Zero-Trust" at the architectural level rather than just the network level. Hyperautomation in DevOps: AI-driven pipelines have reduced deployment failure rates to under 15% for early adopters, widening the gap between teams using manual handoffs and those using "Self-Healing" infrastructure.'
    },
]

const Home = () => {
  const [newsItems, setNewsItems] = useState([]);
  return (
    <div className='main-container'>
      <NavBar />
      <div className='content'>
        <h1 className='news-date'>Tech Update for Developers | February 11, 2026</h1>
        <ul className='news-container'>
          {dummyNews.map((news) => <NewsItem key={news.id} news={news} />)}
        </ul>
      </div>
    </div>
  )
}

export default Home