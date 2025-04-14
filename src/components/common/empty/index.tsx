import EmptyImg from '../../../assets/images/empty.png'

export default function EmptyList(){
  return(
    <div className='w-full flex flex-col justify-center items-center'>
      <img src={EmptyImg} alt='' className='w-96'/>
      <span className='text-xl font-bold mb-10'>Ops! Parece que não tem nada aqui</span>
    </div>
  )
}